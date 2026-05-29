function formatParagraph(text: string, index: number) {
  const boldLead = text.match(/^\*\*(.+?)\*\*\s*([\s\S]*)$/);
  if (boldLead) {
    return (
      <p key={index}>
        <strong>{boldLead[1]}</strong>
        {boldLead[2] ? ` ${boldLead[2]}` : ""}
      </p>
    );
  }
  return <p key={index}>{text}</p>;
}

export function ArticleContent({ content }: { content: string }) {
  const paragraphs = content.split("\n\n").filter(Boolean);
  return (
    <div className="prose-content text-slate-700">
      {paragraphs.map((p, i) => formatParagraph(p.trim(), i))}
    </div>
  );
}
