import React from "react";
import { Container, Title, Text, Paper } from "@mantine/core";

const PrivacyPolicy = () => {
  return (
    <Container size="md" my={40} style={{ paddingTop: '120px' }}>
      <Paper p="lg" shadow="sm" withBorder>
        <Title order={1} align="center" mb="lg">
          Privacy Policy
        </Title>
        <Text mb="md">
          Your privacy is important to us. It is YouCalendy's policy to respect
          your privacy regarding any information we may collect from you across
          our website, and other sites we own and operate.
        </Text>

        <Title order={3} mt="xl" mb="md">
          1. Information We Collect
        </Title>
        <Text mb="md">
          We only ask for personal information when we truly need it to provide
          a service to you. We collect it by fair and lawful means, with your
          knowledge and consent. We also let you know why we're collecting it
          and how it will be used.
        </Text>

        <Title order={3} mt="xl" mb="md">
          2. How We Use Your Information
        </Title>
        <Text mb="md">
          We use the information we collect in various ways, including to:
          <ul className="list-disc list-inside ml-4">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>
              Communicate with you, either directly or through one of our
              partners, including for customer service, to provide you with
              updates and other information relating to the website, and for
              marketing and promotional purposes
            </li>
            <li>Send you emails</li>
            <li>Find and prevent fraud</li>
          </ul>
        </Text>

        <Title order={3} mt="xl" mb="md">
          3. Log Files
        </Title>
        <Text mb="md">
          YouCalendy follows a standard procedure of using log files. These
          files log visitors when they visit websites. All hosting companies do
          this and a part of hosting services' analytics. The information
          collected by log files include internet protocol (IP) addresses,
          browser type, Internet Service Provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks.
        </Text>
        <Title order={3} mt="xl" mb="md">
          4. Cookies and Web Beacons
        </Title>
        <Text>
          Like any other website, YouCalendy uses 'cookies'. These cookies are
          used to store information including visitors' preferences, and the
          pages on the website that the visitor accessed or visited. The
          information is used to optimize the users' experience by customizing
          our web page content based on visitors' browser type and/or other
          information.
        </Text>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy; 