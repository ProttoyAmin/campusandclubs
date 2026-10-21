import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  EmptyMedia
} from "design/components/ui/empty";

const EmptyState = ({
  description,
  title,
  children,
  icon
}: {
  description?: string;
  title: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          {icon}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{children}</EmptyContent>
    </Empty>
  );
};

export default EmptyState;
