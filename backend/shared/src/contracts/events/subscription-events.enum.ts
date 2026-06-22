export enum SubscriptionExchangeName {
  TRIAL_STARTED = "identity.subscription.trial.started.exchange",
  PLAN_ACTIVATED = "identity.subscription.plan.activated.exchange",
  PLAN_CANCELED = "identity.subscription.plan.canceled.exchange",
  PLAN_EXPIRED = "identity.subscription.plan.expired.exchange",
}

export enum SubscriptionRoutingKey {
  TRIAL_STARTED = "subscription.trial.started",
  PLAN_ACTIVATED = "subscription.plan.activated",
  PLAN_CANCELED = "subscription.plan.canceled",
  PLAN_EXPIRED = "subscription.plan.expired",
}
