const AdminPageHeader = ({ title, description, children }) => (
  <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h1 className="text-3xl font-bold text-ink-deep">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{description}</p> : null}
    </div>
    {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
  </div>
);

export default AdminPageHeader;
