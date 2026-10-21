const AppSpinner = () => {
    return (
        <div>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </div>
    )
}
export default AppSpinner