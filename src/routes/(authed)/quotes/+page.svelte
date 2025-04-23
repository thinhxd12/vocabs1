<script>
  let flipped = false;

  function flipRight() {
    flipped = true;
  }

  function flipLeft() {
    flipped = false;
  }
</script>

<div
  class="flex flex-col items-center justify-center bg-blue-200 w-[1150px] h-[calc(100vh-42px)]"
>
  <div class="book">
    <div class="book-page book-page-1">
      <p class="book-content">
        PAGE1 Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Excepturi, veniam? Dolorum explicabo exercitationem temporibus tenetur
        mollitia quo suscipit aspernatur, labore corporis a quam culpa natus
        quos vero fuga, vitae, sunt incidunt accusantium veritatis distinctio
        asperiores eius error! Natus nemo quasi quaerat dolores, porro deserunt
        molestias corrupti accusantium! Ex, tempora ipsum?
      </p>
    </div>

    <div class="book-page book-page-4">
      <p class="book-content">
        PAGE4 Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Excepturi, veniam? Dolorum explicabo exercitationem temporibus tenetur
        mollitia quo suscipit aspernatur, labore corporis a quam culpa natus
        quos vero fuga, vitae, sunt incidunt accusantium veritatis distinctio
        asperiores eius error! Natus nemo quasi quaerat dolores, porro deserunt
        molestias corrupti accusantium! Ex, tempora ipsum?
      </p>
    </div>
    <div class="book-page book-page-2 {flipped ? 'flipped' : ''}">
      <div class="book-page-front">
        <p class="book-content">
          PAGE2 Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          Excepturi, veniam? Dolorum explicabo exercitationem temporibus tenetur
          mollitia quo suscipit aspernatur, labore corporis a quam culpa natus
          quos vero fuga, vitae, sunt incidunt accusantium veritatis distinctio
          asperiores eius error! Natus nemo quasi quaerat dolores, porro
          deserunt molestias corrupti accusantium! Ex, tempora ipsum?
        </p>
      </div>
      <div class="book-page-back">
        <p class="book-content">
          PAGE3 Lorem ipsum, dolor sit amet consectetur adipisicing elit.
          Excepturi, veniam? Dolorum explicabo exercitationem temporibus tenetur
          mollitia quo suscipit aspernatur, labore corporis a quam culpa natus
          quos vero fuga, vitae, sunt incidunt accusantium veritatis distinctio
          asperiores eius error! Natus nemo quasi quaerat dolores, porro
          deserunt molestias corrupti accusantium! Ex, tempora ipsum?
        </p>
      </div>
    </div>
  </div>

  <div class="controls">
    <button onclick={flipLeft}>⬅️ Flip Left</button>
    <button onclick={flipRight}>➡️ Flip Right</button>
  </div>
</div>

<style>
  /* --body-bg: #fafafa;
    --page-bg: #f5f5f5;
    --dark-text: #2a2935; */

  .book {
    width: 750px;
    height: 550px;
    display: flex;
    perspective: 2000px;
  }

  .book::before {
    content: "";
    position: absolute;
    width: 770px;
    height: 550px;
    top: 0;
    left: -10px;
    background-color: #e5e5e5;
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
  }

  .book-page {
    position: relative;
    width: 50%;
    height: 100%;
    display: grid;
    transform: rotateY(0deg);
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform-origin: 0% 0%;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
    border: 1px solid rgba(204, 204, 204, 0.7);
  }
  .book-page:nth-of-type(1) {
    background-image: linear-gradient(
      -90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }

  .book-page-1 {
    cursor: pointer;
    overflow: hidden;
  }

  .book-page-2 {
    position: absolute;
    right: 0;
    pointer-events: none;
    transform-style: preserve-3d;
    background-color: #f5f5f5;
    background-image: linear-gradient(
      90deg,
      #e3e3e3 0%,
      rgba(247, 247, 247, 0) 18%
    );
  }
  .book-page-4 {
    cursor: pointer;
  }

  .book-page-front {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotateY(0deg) translateZ(1px);
  }
  .book-page-back {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: rotateY(180deg) translateZ(1px);
  }

  .flipped {
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transform: rotateY(-180deg);
  }

  .book-content {
    height: 100%;
    width: 100%;
    font-size: 14px;
    line-height: 22px;
  }

  .book-page-1 .book-content,
  .book-page-back .book-content {
    padding: 50px 25px 50px 45px;
  }

  .book-page-4 .book-content,
  .book-page-front .book-content {
    padding: 50px 45px 50px 25px;
  }
</style>
