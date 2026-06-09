export function AmbientGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20,184,166,0.08), transparent 70%)',
          top: '-200px',
          left: '-200px',
          animation: 'float1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.05), transparent 70%)',
          bottom: '-100px',
          right: '-200px',
          animation: 'float2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.03), transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'float3 22s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, -15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(calc(-50% + 20px), calc(-50% - 10px)); }
        }
      `}</style>
    </div>
  );
}
