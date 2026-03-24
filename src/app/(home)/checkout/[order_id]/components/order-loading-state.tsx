type OrderLoadingStateProps = {
    message: string;
};

export default function OrderLoadingState({ message }: OrderLoadingStateProps) {
    return (
        <main className="max-w-6xl mx-auto px-6 pt-12">
            <p className="text-white/70">{message}</p>
        </main>
    );
}