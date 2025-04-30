import { Progress } from "../../ui/Progress";

export default function TabDetail() {
  return (
    <div className="flex justify-between items-center">
      <div className="pr-4 border-r border-itemborder space-y-4 items-center">
        <div className="grid ">
          <span className="text-sm text-muted-foreground">Txns</span>
          <span>4</span>
        </div>
        <div className="grid ">
          <span className="text-sm text-muted-foreground">Vol</span>
          <span>$40</span>
        </div>
      </div>
      <div className="w-full pl-4 col-span-3 space-y-3">
        <div className="grid ">
          <div className="flex justify-between items-center">
            <div className="grid text-left">
              <span className="text-sm text-muted-foreground">Buys</span>
              <span>2</span>
            </div>
            <div className="grid text-right">
              <span className="text-sm text-muted-foreground">Sells</span>
              <span>2</span>
            </div>
          </div>
          <Progress value={50} className="h-1" />
        </div>
        <div className="grid ">
          <div className="flex justify-between items-center">
            <div className="grid text-left">
              <span className="text-sm text-muted-foreground">Buy Vol</span>
              <span>$20</span>
            </div>
            <div className="grid text-right">
              <span className="text-sm text-muted-foreground">Sell Vol</span>
              <span>$20</span>
            </div>
          </div>
          <Progress value={50} className="h-1" />
        </div>
      </div>
    </div>
  );
}