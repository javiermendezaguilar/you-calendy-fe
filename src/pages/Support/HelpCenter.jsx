import React from "react";
import { Container, Title, Text, Accordion } from "@mantine/core";
import { useBatchTranslation } from "../../contexts/BatchTranslationContext";

const HelpCenter = () => {
  const { tc } = useBatchTranslation();

  const faqs = [
    {
      value: "q1",
      question: tc('howDoICreateAnAccount'),
      answer: tc('toCreateAnAccountClickOnTheSignUpButton'),
    },
    {
      value: "q2",
      question: tc('howDoIBookAnAppointment'),
      answer: tc('onceLoggedInYouCanBrowseAvailableServices'),
    },
    {
      value: "q3",
      question: tc('canIRescheduleOrCancelMyAppointment'),
      answer: tc('yesYouCanRescheduleOrCancelYourAppointment'),
    },
    {
      value: "q4",
      question: tc('howDoIUpdateMyProfileInformation'),
      answer: tc('youCanUpdateYourProfileInformation'),
    },
    {
      value: "q5",
      question: tc('whatPaymentMethodsDoYouAccept'),
      answer: tc('weAcceptVariousPaymentMethods'),
    },
  ];

  return (
    <Container size="md" my={40} style={{ paddingTop: '120px' }}>
      <Title order={1} align="center" mb="lg">
        {tc('helpCenter')}
      </Title>
      <Text align="center" mb="xl">
        {tc('frequentlyAskedQuestions')}
      </Text>
      <Accordion variant="separated">
        {faqs.map((faq) => (
          <Accordion.Item key={faq.value} value={faq.value}>
            <Accordion.Control>{faq.question}</Accordion.Control>
            <Accordion.Panel>{faq.answer}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default HelpCenter;