const webhookTrigger = async (node) => {
  return {
    triggeredAt: new Date().toISOString(),
    payload: {
      message: "Sample trigger payload — real webhook receiving will be built in a future step.",
    },
  };
};

export default webhookTrigger;