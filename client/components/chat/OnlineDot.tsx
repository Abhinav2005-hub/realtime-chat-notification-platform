interface Props {
    online: boolean;
}

export default function OnlineDot({ online }: Props) {
    return (
        <span
          className={`w-2 h-2 rounded full ${
            online ? "bg-green-500" : "bg-gray-400"
          }`}
        />
    );
}