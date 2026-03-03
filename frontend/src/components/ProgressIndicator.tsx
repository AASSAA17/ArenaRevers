import React from 'react';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isPending = stepNumber > currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div className="relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${isCompleted ? 'bg-[#2ECC71] text-white' : ''}
                    ${isCurrent ? 'bg-[#2ECC71] text-white ring-4 ring-[#EAFBF3]' : ''}
                    ${isPending ? 'bg-[#F5F5F5] text-[#808080] border-2 border-[#D9D9D9]' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check size={20} />
                  ) : (
                    <span className="body-s font-semibold">{stepNumber}</span>
                  )}
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      absolute top-5 left-10 w-full h-0.5 transition-all
                      ${isCompleted ? 'bg-[#2ECC71]' : 'bg-[#D9D9D9]'}
                    `}
                    style={{ width: 'calc(100% - 2.5rem)' }}
                  />
                )}
              </div>
              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={`
                    caption-r
                    ${isCurrent ? 'text-[#2ECC71] font-medium' : ''}
                    ${isCompleted ? 'text-[#4D4D4D]' : ''}
                    ${isPending ? 'text-[#808080]' : ''}
                  `}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

