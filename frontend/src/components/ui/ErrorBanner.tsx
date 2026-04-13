function ErrorBanner({ message }: { message: string }) {
    return (
      <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
        {message}
      </div>
    )
  }

export default ErrorBanner;