// Qanunsuz tikintilərin aşkarı — public/ qovluğundakı standalone detector HTML-i
// iframe ilə göstərir (fayl çox böyükdür, SPA içinə import edilmir).
// Wrapper shell-in 24px padding-ini neytrallaşdırıb tam sahəni doldurur
// (header = 56px → main hündürlüyü 100vh - 56px).
export function IllegalConstructionPage() {
  return (
    <div style={{ height: 'calc(100vh - 56px)', width: 'calc(100% + 48px)', margin: -24, overflow: 'hidden' }}>
      <iframe
        src="/qanunsuz-tikili-detector.html"
        title="Qanunsuz tikintilərin aşkarı"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}
