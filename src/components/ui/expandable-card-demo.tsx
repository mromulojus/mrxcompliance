import { ProjectStatusCard } from "@/components/ui/expandable-card";

function ExpandableCardDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ProjectStatusCard
        title="Design System"
        progress={100}
        dueDate="Dec 31, 2023"
        contributors={[
          { name: "Emma", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&auto=format&fit=crop&q=60" },
          { name: "John", image: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=256&auto=format&fit=crop&q=60" },
          { name: "Lisa", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=256&auto=format&fit=crop&q=60" },
          { name: "David", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=60" },
        ]}
        tasks={[
          { title: "Create Component Library", completed: true },
          { title: "Implement Design Tokens", completed: true },
          { title: "Write Style Guide", completed: true },
          { title: "Set up Documentation", completed: true },
        ]}
        githubStars={256}
        openIssues={0}
      />

      <ProjectStatusCard
        title="Analytics Dashboard"
        progress={45}
        dueDate="Mar 1, 2024"
        contributors={[
          { name: "Michael", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&auto=format&fit=crop&q=60" },
          { name: "Sophie", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&auto=format&fit=crop&q=60" },
          { name: "James", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=60" },
        ]}
        tasks={[
          { title: "Design Dashboard Layout", completed: true },
          { title: "Implement Data Fetching", completed: true },
          { title: "Create Visualization Components", completed: false },
          { title: "Add Export Features", completed: false },
          { title: "User Testing", completed: false },
        ]}
        githubStars={89}
        openIssues={8}
      />
    </div>
  );
}

export { ExpandableCardDemo };

