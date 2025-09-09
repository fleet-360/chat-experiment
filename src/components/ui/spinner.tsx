
const Spinner = () => {
  return (
    <div className="absolute size-full z-10 bg-foreground/20">
      <div className="absolute top-1/2 left-1/2  -translate-1/2 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default Spinner