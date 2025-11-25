export function useModelAPI() {
  const sendToModel = async (msg:any) => {
    const res = await fetch("https://xxx/api/chat", {
      method: "POST",
      body: JSON.stringify(msg),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    return {
      id: `ai_${Date.now()}`,
      role: "assistant",
      type: "text",
      content: data.reply
    };
  };

  return { sendToModel };
}
