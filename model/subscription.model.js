import mongoose from "mongoose";
import dayjs from 'dayjs-with-plugins';

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Subscription is required"],
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    price: {
      type: Number,
      required: [true, "Subscription price is required"],
      min: [0, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP"],
      default: "USD",
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      enum: ["daily", "weekly", "monthly", "yearly"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Sports",
        "News",
        "Entertainment",
        "Lifestyle",
        "Technology",
        "Finance",
        "Politics",
        "Business",
        "Other",
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Canceled", "Expired", "Paused"],
      default: "Active",
    },
    startDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value <= new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "renewal date must be after the Start Date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-calculates renewal date if missing. did in Date before I knew about dayjs
subscriptionSchema.pre("validate", function (next) {
  // Auto-set renewalDate if missing (works for updates, but not initial creation)
  if (!this.renewalDate && this.startDate && this.frequency) {
    const renewalPeriods = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };
    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + renewalPeriods[this.frequency]
    );
  }

  next(); 
});

subscriptionSchema.pre("save", async function(next) {
  const now = dayjs();
  
  // Initial renewal date calculation
  if (!this.renewalDate && this.startDate && this.frequency) {
    this.renewalDate = dayjs(this.startDate)
      .add(this.frequency === 'daily' ? 1 : 
           this.frequency === 'weekly' ? 7 :
           this.frequency === 'monthly' ? 30 : 365, 'day')
      .toDate();
  }

  // Renewal processing for active subscriptions
  if (this.status === "Active" && dayjs(this.renewalDate).isBefore(now)) {
    const renewalDate = dayjs(this.renewalDate);
    const nextRenewal = renewalDate.add(1,
      this.frequency === 'daily' ? 'day' :
      this.frequency === 'weekly' ? 'week' :
      this.frequency === 'monthly' ? 'month' : 'year'
    );
    
    this.renewalDate = nextRenewal.toDate();
    
    if (renewalDate.isBefore(now.subtract(30, 'day'))) {
      this.status = 'Expired';
    }
  }
  
  next();
});

subscriptionSchema.statics.processRenewals = async function(userId) {
  const now = dayjs();
  const thirtyDaysAgo = now.subtract(30, 'day');
  
  // Finds all active subscriptions with passed renewal dates
  const subscriptions = await this.find({
    user: userId,
    status: "Active",
    renewalDate: { $lt: now.toDate() }
  });

  // Processes each subscription
  const bulkOps = subscriptions.map(sub => {
    const renewalDate = dayjs(sub.renewalDate);
    let nextRenewalDate;
    
    // Calculates next renewal based on frequency
    switch (sub.frequency) {
      case 'daily':
        nextRenewalDate = renewalDate.add(1, 'day');
        break;
      case 'weekly':
        nextRenewalDate = renewalDate.add(1, 'week');
        break;
      case 'monthly':
        nextRenewalDate = renewalDate.add(1, 'month');
    // Handle month-end edge cases
        if (nextRenewalDate.date() !== renewalDate.date()) {
          nextRenewalDate = nextRenewalDate.endOf('month');
        }
        break;
      case 'yearly':
        nextRenewalDate = renewalDate.add(1, 'year');
        break;
    }

    // Determines if subscription should be expired
    const newStatus = renewalDate.isBefore(thirtyDaysAgo) ? 'Expired' : 'Active';

    return {
      updateOne: {
        filter: { _id: sub._id },
        update: {
          $set: {
            renewalDate: nextRenewalDate.toDate(),
            status: newStatus
          }
        }
      }
    };
  });

  // Executes bulk operations
  if (bulkOps.length > 0) {
    const result = await this.bulkWrite(bulkOps);
    return result;
  }

  return { nModified: 0 };
};

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
