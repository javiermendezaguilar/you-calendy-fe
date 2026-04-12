import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Image,
  Stack,
} from "@mantine/core";
import clipPathGroup from "../../../assets/clip-path-group.png";
import frame1410088965 from "../../../assets/frame-1410088965.svg";
import frame1 from "../../../assets/frame1.png";
import frame2 from "../../../assets/frame2.png";
import frame3 from "../../../assets/frame3.png";
import frame4 from "../../../assets/frame4.png";
import frame5 from "../../../assets/frame5.png";
import frame6 from "../../../assets/frame6.png";
import bg2 from "../../../assets/keybenefits-bg.webp";
import { motion } from "framer-motion";

const benefits = [
  {
    title: "Appointment History",
    description:
      "Easily access past bookings to track client visits and preferences.",
    image: frame2,
    bgColor: "#f3ffe0",
  },
  {
    title: "Time Management",
    description:
      "Streamline your schedule with automated booking and reminders.",
    image: frame1,
    bgColor: "#ecf5ff",
  },
  {
    title: "Professionalism",
    description:
      "Enhance your brand with organized workflows and seamless client interactions.",
    image: frame3,
    bgColor: "#f3ffe0",
  },
  {
    title: "Time Savings",
    description: "Reduce manual tasks and focus on delivering quality service.",
    image: frame4,
    bgColor: "#ecf5ff",
  },
  {
    title: "Trust",
    description:
      "Build strong client relationships with reliable and transparent processes.",
    image: frame5,
    bgColor: "#f3ffe0",
  },
  {
    title: "Revenue Growth",
    description:
      "Increase bookings and maximize profits with efficient management tools.",
    image: frame6,
    bgColor: "#ecf5ff",
  },
  {
    title: "Communication",
    description:
      "Keep clients informed with instant updates and personalized messages.",
    image: clipPathGroup,
    bgColor: "#f3ffe0",
  },
  {
    title: "Flexibility",
    description:
      "Manage your business anytime, anywhere, with full control over your schedule.",
    image: frame1410088965,
    bgColor: "#ecf5ff",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Benefits() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
      id="features"
      style={{
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100%'
      }}
    >
      <Container
        size="xl"
        py={{ base: 40, md: 80 }}
        style={{
          marginTop: { base: 32, md: 64 },
        }}
        className="px-4 sm:px-6 md:px-8"
      >
        <Stack align="center" spacing="md" mb={{ base: 30, md: 50 }}>
          <motion.h1
            variants={itemVariants}
            className="text-[#036] text-center text-4xl sm:text-5xl font-bold max-md:leading-[65px] max-sm:leading-[49px]"
          >
            Key Benefits
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-[#333] text-center text-base sm:text-lg font-normal max-w-[840px] max-md:text-[22px] max-md:leading-7 max-sm:text-base max-sm:leading-6 px-2"
          >
            Effortlessly manage your organization with a feature-rich Super Admin
            panel designed for ultimate control, security, and efficiency.
          </motion.p>
        </Stack>

        <SimpleGrid
          cols={{ base: 1, xs: 2, md: 4 }}
          spacing={{ base: "sm", sm: "md", md: "xl" }}
        >
          {benefits.map((benefit, index) => (
            <motion.div variants={itemVariants} key={index}>
              <Card
                padding={{ base: "md", md: "lg" }}
                radius="md"
                style={{
                  backgroundColor: "white",
                  boxShadow: "0px 15px 15px -10px rgba(38, 44, 61, 0.12)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                className="hover:shadow-md"
              >
                <Card.Section>
                  <div
                    style={{
                      backgroundColor: benefit.bgColor,
                      padding: "16px",
                      width: "70px",
                      height: "70px",
                      borderRadius: "12px",
                      margin: "20px auto 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={benefit.image}
                      alt={benefit.title}
                      width={40}
                      height={40}
                      fit="contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </Card.Section>

                <Stack spacing="sm" align="center">
                  <Text
                    size={{ base: "lg", md: "xl" }}
                    fw={550}
                    c="#333333"
                    ta="center"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    {benefit.title}
                  </Text>
                  <Text
                    size="xs"
                    c="#868686"
                    ta="center"
                    style={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    {benefit.description}
                  </Text>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </motion.div>
  );
}

export default Benefits;
