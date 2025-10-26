export default function AppInfoBox({
  title,
  subTitle,
}: {
  title: string;
  subTitle: string;
}) {
  return (
    <div className="rounded bg-white p-5 shadow dark:bg-secondary dark:shadow">
      <h1 className="mb-2 text-2xl font-semibold text-primary dark:text-white">
        {title}
      </h1>
      <p className="text-xl text-primary dark:text-white">{subTitle}</p>
    </div>
  );
}
