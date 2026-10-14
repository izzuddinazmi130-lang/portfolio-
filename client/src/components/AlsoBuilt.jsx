// The "also built" cards that used to sit under the tiles on the projects
// page. Pulled out into its own component so the new projects page can still
// show them below the pinned project stage.
export default function AlsoBuilt() {
  return (
    <div className="also-built">
      <h4>also built</h4>
      <div className="also-list">
        <div className="also-item">
          <b>Project management app (Laravel)</b>Full-stack app with role-based access, built during my
          internship at MySoftcare Solution.
        </div>
        <div className="also-item">
          <b>Security audit: eLesen Kemaman</b>Brute-force endpoint testing that surfaced multiple
          unsecured pages; delivered a breach report with fixes.
        </div>
        <div className="also-item">
          <b>Mentoring an intern</b>Currently guiding an IT programmer intern building a stock
          inventory / POS system.
        </div>
      </div>
    </div>
  );
}