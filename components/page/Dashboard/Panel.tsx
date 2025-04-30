import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

type PanelProps = {
  children: React.ReactNode;
  title: string;
  height: string;
};

const Panel: React.FC<PanelProps> = ({ children, title, height }) => {
  const classes = `${height} w-full`;
  return (
    <section className="pb-1 rounded-lg shadow-md relative bg-panel h-full">
      <h3 className="z-0 top-0 py-2 px-4 flex items-center text-xl font-semibold text-bluesky backdrop-blur-sm rounded-t-lg">
        {title}
      </h3>
      <ScrollArea className={classes}>
        {children}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </section>
  );
};

export default Panel;
