// Example custom command script for GoatBot v2
// Place your custom commands in this directory

module.exports = {
  name: "example",
  description: "An example custom command",
  category: "custom",
  usage: "/example [text]",
  cooldown: 5,
  execute: async ({ api, event, args }) => {
    const text = args.join(" ") || "Hello from custom command!";
    api.sendMessage(`Custom Command Response: ${text}`, event.threadID);
  },
};
