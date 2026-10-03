import { ScrubText } from "./ScrubText";

/** The lab's name, set as a dictionary entry — it is a real Vietnamese word. */
export function Definition({ count, from, to }: { count: number; from?: string; to?: string }) {
  const span = from && to && from !== to ? `, from ${from} to ${to}` : "";
  return (
    <section className="definition" aria-labelledby="definition-word">
      <div className="definition-head">
        <h2 id="definition-word" className="definition-word" lang="vi">
          ham vọc
        </h2>
        <p className="definition-pos label">Vietnamese · verb</p>
      </div>
      <ol className="definition-senses">
        <li>
          <ScrubText>
            To be unable to leave a thing alone — to poke at it, take it apart and put it back together until it
            makes sense.
          </ScrubText>
        </li>
        <li>
          <ScrubText>{`A student research lab that works this way: ${count} people${span}, each poking at one stubborn problem.`}</ScrubText>
        </li>
      </ol>
    </section>
  );
}
