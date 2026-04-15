import { logoutMedicine } from "./actions";

export default function MedicineContent() {
  return (
    <article className="article article-koan">
      <div className="eyebrow">closed · behind another door · you found it</div>
      <h1 style={{ textAlign: "center" }}>the cabinet</h1>

      <div className="koan">
        <p className="koan-line">the door was the point.</p>
        <p className="koan-line muted">there is no room.</p>
        <p className="koan-line">or — the clues were the room,</p>
        <p className="koan-line">and you were standing in it the whole time.</p>
      </div>

      <div className="koan-rule" />

      <p className="koan-postscript">
        If you got here by guessing, you understand how saapai thinks. The method
        is the medicine. The search is the dosage.
      </p>

      <form action={logoutMedicine} className="closed-footer">
        <button type="submit" className="logout-btn">close the cabinet</button>
      </form>
    </article>
  );
}
