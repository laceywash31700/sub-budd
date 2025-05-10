import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import Subscription from "../model/subscription.model.js";
import { sendReminderEmail } from "../ultis/send-email.js";

// days before renewal date to send reminder
const REMINDERS = [7, 5, 2, 1];

// this function sends the user a email corresponding to days before a renewal date.
export const sendReminders = serve(async (context) => {
  // grabs id of subscription we want to send.
  const { subscriptionId } = context.requestPayload;
  const subscription = await fetchSubscription(context, subscriptionId);
  ///////////////////////////////////////////////////////////////////////////////////

  // checks if there is a subscription or if it is active and if the renewalDate is before the current date
  //  if not we exit workflow
  if (!subscription || subscription.status !== "Active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription. ID: ${subscriptionId}. Stopping Workflow.`
    );
    return;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////

  // loop that trigger for each corresponding date in REMINDER array and puts workflow to sleep
  // and wakes it up on each reminder date
  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilNextReminder(
        context,
        `${daysBefore} days before reminder`,
        reminderDate
      );
    }

    if (dayjs().isSame(reminderDate, 'day')) {
      await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }
  }
  /////////////////////////////////////////////////////////////////////////////
});

// Helper Functions
const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return await Subscription.findById(subscriptionId).populate(
      "user",
      "firstName email"
    );
  });
};

const sleepUntilNextReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}.`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Trigger ${label} reminder`);
    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription
    });
  });
};
//////////////////////////////////////////////////////
