const webhookTrigger = async (node, input, jobData) => {
  return {
    triggeredAt: new Date().toISOString(),
    payload: jobData?.triggerPayload || {
      message: "No payload provided — this workflow was likely run manually, not via webhook.",
    },
  };
};

export default webhookTrigger;