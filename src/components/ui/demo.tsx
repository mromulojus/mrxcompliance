import AvatarGroup from "@/components/ui/avatar-group";

export default function DemoOne() {
  return (
    <AvatarGroup
      items={[
        {
          id: 1,
          name: "John Doe",
          designation: "Software Engineer",
          image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
        {
          id: 2,
          name: "Jane Smith",
          designation: "Product Manager",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
        {
          id: 3,
          name: "Jim Beam",
          designation: "Marketing Manager",
          image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
        {
          id: 4,
          name: "John Doe",
          designation: "Software Engineer",
          image: "https://images.unsplash.com/photo-1542206395-9feb3edaa68e?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
        {
          id: 5,
          name: "John Doe",
          designation: "Software Engineer",
          image: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
        {
          id: 6,
          name: "John Doe",
          designation: "Software Engineer",
          image: "https://images.unsplash.com/photo-1545996124-0501ebae84d0?w=256&q=80&auto=format&fit=facearea&facepad=2",
        },
      ]}
      maxVisible={5}
      size="md"
    />
  );
}

"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Background lights are cool you know.
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          And this, is chemical burn.
        </div>
        <button className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2">
          Debug now
        </button>
      </motion.div>
    </AuroraBackground>
  );
}