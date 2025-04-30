import { formatTokenPrice } from "../../types/helper";
import type React from "react";

interface PriceFormatterProps {
  price: number;
  className?: string;
}

export const PriceFormatter: React.FC<PriceFormatterProps> = ({
  price,
  className = "",
}) => {
  const formatPrice = (price: number) => {
    if (!price) {
      return {
        prefix: "0.0",
        zeros: "",
        mainPart: "0",
      };
    }
    if (price < 1e-3) {
      const priceString = formatTokenPrice(price, {
        showCurrencySymbol: false,
      });
      const [wholePart, decimalPart] = priceString.split(".");
      const leadingZeros = countLeadingZeros(decimalPart);

      return {
        prefix: `${wholePart}.0`,
        zeros: `${leadingZeros}`,
        mainPart: removeLeadingZeros(decimalPart),
      };
    } else {
      const parts = price
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        .split(".");
      return {
        prefix: `${parts[0]}.`,
        zeros: "",
        mainPart: parts[1] || "00",
      };
    }
  };

  const { prefix, zeros, mainPart } = formatPrice(price);

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      <span>{prefix}</span>
      <span className="translate-y-[4px]">{zeros}</span>
      <span>{mainPart}</span>
    </div>
  );
};

function countLeadingZeros(decimalPart: string): number {
  let count = 0;
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === "0") {
      count++;
    } else {
      break; // Stop counting when a non-zero digit is encountered
    }
  }
  return count;
}

function removeLeadingZeros(decimalPart: string): string {
  const leadingZeros = countLeadingZeros(decimalPart);
  return decimalPart.substring(leadingZeros).slice(0, 4);
}
