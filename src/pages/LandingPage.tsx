import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-black/50 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className="text-sm text-muted">March 15-17, 2026</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            <span className="accent-text">Innovate AI</span>
            <span className="text-white"> 2026</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted mb-4">Annual Tech Conference</p>
          <p className="text-lg text-muted-dark mb-12 max-w-2xl mx-auto">
            Join the world's leading AI researchers, engineers, and innovators for three days
            of cutting-edge insights, hands-on workshops, and networking opportunities.
          </p>

          <div className="flex justify-center">
            <Link to="/auth" className="btn-primary text-lg px-8 py-4">
              Register Now
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2">
            <div className="w-1 h-2 bg-accent rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why Attend?</h2>
          <p className="text-center text-muted mb-16 max-w-2xl mx-auto">
            Experience the future of AI through hands-on workshops, expert panels, and networking with industry leaders.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: '50+ Expert Speakers',
                description: 'Learn from pioneers in LLMs, computer vision, robotics, and AI safety.',
              },
              {
                title: '8 Hands-on Workshops',
                description: 'Practical sessions on fine-tuning, RAG systems, edge AI, and more.',
              },
              {
                title: 'Networking Events',
                description: 'Connect with researchers, engineers, and entrepreneurs from around the world.',
              },
              {
                title: 'Latest Innovations',
                description: 'Be the first to see groundbreaking AI technologies and demos.',
              },
            ].map((item, index) => (
              <div key={index} className="card group hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Speakers' },
              { value: '500+', label: 'Attendees' },
              { value: '8', label: 'Workshops' },
              { value: '3', label: 'Days' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold accent-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Innovate?
          </h2>
          <p className="text-muted mb-8">
            Secure your spot today. Early bird pricing ends February 28, 2026.
          </p>
          <Link to="/auth" className="btn-primary text-lg px-8 py-4">
            Get Your Ticket Now
          </Link>
        </div>
      </section>
    </div>
  );
}
