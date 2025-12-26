interface Props {
    count: number;
}

export default function NotificationBadge({ count }: Props) {
    if (count === 0) return null;

    return (
        <span className="bg-red-600 text-white rounded-full px-2 text-sm">
            {count}
        </span>
    );
}