import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "design/components/ui/empty";

const EmptyState = ({
  description,
  title,
  children,
}: {
  description?: string;
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
    </Empty>
  );
};

export default EmptyState;
