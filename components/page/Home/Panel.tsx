import { Button } from "../../ui/Button";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { FilterIcon } from "lucide-react";

type PanelProps = {
  children?: React.ReactNode;
  title: string;
  height: string;
};

const Panel: React.FC<PanelProps> = ({ children, title, height }) => {
  const classes = `${height} w-full`;
  return (
    <section className="pb-1 rounded-lg shadow-md relative bg-panel">
      <div className="flex justify-between items-center">
        <h3 className="z-0 top-0 py-2 px-4 flex items-center text-xl font-semibold text-bluesky backdrop-blur-sm rounded-t-lg">
          {title}
        </h3>
        <Button variant="ghost" size="sm" className="text-gray-400">
          <FilterIcon className="w-4 h-4" />
          Filter
        </Button>
      </div>
      <ScrollArea className={classes}>
        {children}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </section>
  );
};

export default Panel;
