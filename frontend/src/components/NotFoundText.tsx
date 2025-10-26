export default function NotFoundText({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <h1 className="py-5 text-center text-3xl font-semibold text-secondary opacity-40 dark:text-white">
      {text}
    </h1>
  );
}
