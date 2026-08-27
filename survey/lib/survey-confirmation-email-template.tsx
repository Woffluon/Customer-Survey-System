import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
} from '@react-email/components';
import { Language } from './types';
import {
  mainStyle,
  containerStyle,
  headerSectionStyle,
  badgeStyle,
  titleStyle,
  metaStyle,
  hrStyle,
  cardStyle,
  cardTitleStyle,
  infoTextStyle,
  footerStyle,
} from './email-styles';

interface SurveyConfirmationEmailProps {
  surveyTitle: string;
  respondentName?: string;
  submittedAt: string;
  language: Language;
}

const copy = {
  tr: {
    preview: 'Anket yanıtınız alındı.',
    badge: 'Anket onayı',
    title: 'Yanıtınız alındı',
    greeting: 'Merhaba',
    message: 'Anket yanıtınızı aldım. Zaman ayırdığınız için teşekkür ederim.',
    surveyLabel: 'Anket',
    submittedLabel: 'Gönderim zamanı',
    footer: 'Bu e-posta anket yanıtınızın alındığını doğrulamak için otomatik olarak gönderildi.',
  },
  en: {
    preview: 'Your survey response has been received.',
    badge: 'Survey confirmation',
    title: 'Your response has been received',
    greeting: 'Hello',
    message: 'I have received your survey response. Thank you for taking the time to complete it.',
    surveyLabel: 'Survey',
    submittedLabel: 'Submitted at',
    footer: 'This email was sent automatically to confirm that your survey response was received.',
  },
} as const;

export function SurveyConfirmationEmailTemplate({
  surveyTitle,
  respondentName,
  submittedAt,
  language,
}: SurveyConfirmationEmailProps) {
  const text = copy[language];

  return (
    <Html>
      <Head />
      <Preview>{text.preview}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerSectionStyle}>
            <Text style={badgeStyle}>{text.badge}</Text>
            <Text style={titleStyle}>{text.title}</Text>
            {respondentName && <Text style={metaStyle}>{text.greeting}, {respondentName}</Text>}
          </Section>

          <Hr style={hrStyle} />

          <Section style={cardStyle}>
            <Text style={infoTextStyle}>{text.message}</Text>
            <Text style={cardTitleStyle}>{text.surveyLabel}</Text>
            <Text style={infoTextStyle}>{surveyTitle}</Text>
            <Text style={cardTitleStyle}>{text.submittedLabel}</Text>
            <Text style={infoTextStyle}>{submittedAt}</Text>
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>{text.footer}</Text>
        </Container>
      </Body>
    </Html>
  );
}
