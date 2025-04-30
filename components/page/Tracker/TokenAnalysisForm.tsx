import { Button } from "../../ui/Button";
import { TokenInputForm } from "../../../types/interface";
import { Search, Calendar, ArrowRight, Loader } from "lucide-react";
import {
  FormWrapper,
  FormLabel,
  FormInputWrapper,
  FormInput,
} from "../../ui/form";

interface TokenAnalysisFormProps {
  onAnalyze: () => void;
  input: TokenInputForm;
  setInput: React.Dispatch<React.SetStateAction<TokenInputForm>>;
  loading: boolean;
}

export const TokenAnalysisForm = ({
  onAnalyze,
  input,
  setInput,
  loading,
}: TokenAnalysisFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <FormWrapper className="max-w-4xl border border-bluesky">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="col-span-1 md:col-span-4 space-y-2">
            <FormLabel>Token Address</FormLabel>
            <FormInputWrapper>
              <FormInput
                type="text"
                value={input.tokenAddress}
                onChange={(e) =>
                  setInput({ ...input, tokenAddress: e.target.value })
                }
                placeholder="0x1::aptos_coin::AptosCoin"
              />
            </FormInputWrapper>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-2">
            <FormLabel>Analysis Period (Days)</FormLabel>
            <FormInputWrapper>
              <FormInput
                type="number"
                value={input.days}
                onChange={(e) =>
                  setInput({ ...input, days: Number(e.target.value) })
                }
                min="1"
                max="365"
              />
            </FormInputWrapper>
          </div>

          <div className="col-span-1 flex items-end">
            <Button
              type="submit"
              disabled={loading}
              variant="outline"
              className="w-32 px-2 flex items-center bg-transparent bg-bluesky hover:bg-bluesky/80 text-gray-50 hover:text-gray-50 border border-bluesky"
            >
              {loading ? (
                <Loader className="animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              <span>{loading ? "Analyzing..." : "Analyze"}</span>
            </Button>
          </div>
        </div>
      </form>
    </FormWrapper>
  );
};
