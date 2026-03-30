import React from "react";
import { Container, Title, Text, Paper } from "@mantine/core";

const TermsAndConditions = () => {
  return (
    <Container size="md" my={40} style={{ paddingTop: '120px' }}>
      <Paper p="lg" shadow="sm" withBorder>
        <Title order={1} align="center" mb="lg">
          Terms & Conditions
        </Title>
        <Text mb="md">
          Welcome to YouCalendy. These terms and conditions outline the rules
          and regulations for the use of our website and services. By accessing
          this website, we assume you accept these terms and conditions. Do not
          continue to use YouCalendy if you do not agree to all of the terms
          and conditions stated on this page.
        </Text>

        <Title order={3} mt="xl" mb="md">
          1. Intellectual Property Rights
        </Title>
        <Text mb="md">
          Other than the content you own, under these Terms, YouCalendy and/or
          its licensors own all the intellectual property rights and materials
          contained in this Website. You are granted a limited license only for
          purposes of viewing the material contained on this Website.
        </Text>

        <Title order={3} mt="xl" mb="md">
          2. Restrictions
        </Title>
        <Text mb="md">
          You are specifically restricted from all of the following:
          <ul className="list-disc list-inside ml-4">
            <li>Publishing any Website material in any other media.</li>
            <li>
              Selling, sublicensing and/or otherwise commercializing any Website
              material.
            </li>
            <li>Publicly performing and/or showing any Website material.</li>
            <li>
              Using this Website in any way that is or may be damaging to this
              Website.
            </li>
            <li>
              Using this Website in any way that impacts user access to this
              Website.
            </li>
          </ul>
        </Text>

        <Title order={3} mt="xl" mb="md">
          3. Your Content
        </Title>
        <Text mb="md">
          In these Website Standard Terms and Conditions, “Your Content” shall
          mean any audio, video text, images or other material you choose to
          display on this Website. By displaying Your Content, you grant
          YouCalendy a non-exclusive, worldwide irrevocable, sub-licensable
          license to use, reproduce, adapt, publish, translate and distribute
          it in any and all media.
        </Text>
        <Title order={3} mt="xl" mb="md">
          4. No warranties
        </Title>
        <Text>
          This Website is provided “as is,” with all faults, and YouCalendy
          express no representations or warranties, of any kind related to this
          Website or the materials contained on this Website.
        </Text>
      </Paper>
    </Container>
  );
};

export default TermsAndConditions; 