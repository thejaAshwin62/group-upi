import React from "react";
import { AnimatedTooltip } from "../ui/animated-tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Skeleton } from "../ui/Skeleton";
import { SparklesCore } from "../ui/sparkles";
import { TypewriterEffect } from "../ui/typewriter-effect";

export const AnimatedTooltipDemo = ({ items }) => {
  return (
    <div className="flex flex-row items-center justify-center mb-4 w-full">
      <AnimatedTooltip items={items} />
    </div>
  );
};

export const HoverCardDemo = ({ trigger, content }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-80">{content}</HoverCardContent>
    </HoverCard>
  );
};

export const SkeletonDemo = () => {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
};

export const SparklesDemo = ({ children }) => {
  return <SparklesCore>{children}</SparklesCore>;
};

export const TypewriterEffectDemo = ({ words }) => {
  return <TypewriterEffect words={words} />;
};
