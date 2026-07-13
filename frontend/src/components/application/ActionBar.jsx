import Button from "../ui/Button.jsx";

export default function ActionBar() {
  function handleAction(action) {
    // For now, just log. Later wire API.
    console.log("Officer action:", action);
    alert(`Demo: Action recorded - ${action}`);
  }

  return (
    <section className="section-box print:hidden">
      <h2 className="section-title mb-3">Officer Actions</h2>
      <p className="text-xs md:text-sm text-slate-600 mb-4">
        Based on the evidence and model scores above, record your decision. In
        a full system, your decision and remarks will be stored in the audit
        log.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => handleAction("Approve")}>Approve</Button>
        <Button
          variant="secondary"
          onClick={() => handleAction("Send for field verification")}
        >
          Send for Field Verification
        </Button>
        <Button
          variant="subtle"
          onClick={() => handleAction("Request additional documents")}
        >
          Request More Documents
        </Button>
        <Button
          variant="subtle"
          className="!bg-rose-50 !text-rose-800 hover:!bg-rose-100"
          onClick={() => handleAction("Reject")}
        >
          Reject Application
        </Button>
      </div>
    </section>
  );
}