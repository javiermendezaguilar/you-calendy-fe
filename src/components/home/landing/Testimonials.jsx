import { Title, Text, Container } from "@mantine/core";
import Testimonial from "../../../assets/testimonials.webp";
import { TestimonialRingIcon } from "../../common/Svgs";

const TestimonialTitle = () => (
  <Title order={2} className="text-5xl font-semibold leading-none tracking-[1.3px] max-md:max-w-full max-md:text-[40px]">
    Testimonials
  </Title>
);

const TestimonialQuote = () => (
  <blockquote className="text-lg font-light self-center mt-[29px] max-md:max-w-full">
    YouCalendy has completely transformed the way I manage my
    appointments. My clients love the convenience, and I no longer
    have to deal with last-minute scheduling issues!
  </blockquote>
);

const TestimonialAuthor = () => (
  <cite className="text-2xl font-bold leading-none tracking-[0.48px] mt-[41px] max-md:max-w-full max-md:mt-10 not-italic">
    MARCUS SMITH
  </cite>
);

const Testimonials = () => {
  return (
    <section 
      className="flex flex-col relative w-full items-center text-white text-center justify-center px-[20%] py-12 max-md:max-w-full max-md:px-5"
      aria-label="Testimonials section"
    >
      <img
        src={Testimonial}
        alt="Testimonials background"
        className="absolute h-full w-full object-cover inset-0"
        loading="lazy"
        aria-hidden="true"
      />
      <Container className="relative flex w-full max-w-[1402px] flex-col items-stretch max-md:max-w-full">
        <div 
          className="aspect-[8.13] w-[261px] self-center max-w-full"
          aria-hidden="true"
        >
          <TestimonialRingIcon />
        </div>

        <div className="flex w-full flex-col items-stretch mt-[59px] max-md:max-w-full max-md:mt-10">
          <div className="self-center flex w-[1276px] max-w-full flex-col items-stretch">
            <TestimonialTitle />
            <TestimonialQuote />
          </div>
          <TestimonialAuthor />
        </div>
      </Container>
    </section>
  );
};

export default Testimonials;
