const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-primary">
      <p className="animate-pulse text-light-subtle dark:text-dark-subtle">
        Please wait...
      </p>
    </div>
  );
};

export default Loading;
