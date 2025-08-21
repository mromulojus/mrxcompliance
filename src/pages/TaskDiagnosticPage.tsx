import React from 'react';
import { TaskCreationTest } from '@/components/ui/task-creation-test';

export default function TaskDiagnosticPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center">
        <TaskCreationTest />
      </div>
    </div>
  );
}