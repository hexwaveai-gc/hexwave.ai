const stats = [
  {
    value: "240,909+",
    label: "videos created with Hexwave",
  },
  {
    value: "14,258+",
    label: "creators using Hexwave",
  },
  {
    value: "400+",
    label: "creators reached 100k+ views",
  },
  {
    value: "32 languages",
    label: "and used in 68 countries",
  },
];

export default function StatsSection() {
  return (
    <article className="rounded-3xl px-4 sm:px-6 md:px-8 pb-8 border border-[#252629] mt-4 bg-[#15171A]">
      <div className="relative z-20 h-8 sm:h-10 border border-t-0 border-[#ffffff10] bg-[#15171A]"></div>
      <section className="-mt-3 lg:pt-10 py-8 bg-[#ffffff04] rounded-2xl rounded-t-none border border-t-0 border-[#ffffff10] divide-y sm:divide-x sm:divide-y-0 divide-[#ffffff10] grid sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center sm:px-8 lg:px-10 mx-8 sm:mx-0 py-10 sm:py-4 space-y-2"
          >
            <h2 className="font-euclid text-3xl font-bold bg-gradient-to-l from-[#5AE88F] from-25% to-[#78CDF9] to-60% bg-clip-text text-transparent">
              {stat.value}
            </h2>
            <p className="text-neutral-dark text-sm font-inter">{stat.label}</p>
          </div>
        ))}
      </section>
    </article>
  );
}

