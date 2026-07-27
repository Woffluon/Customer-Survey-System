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
import { SurveyConfig, AnswerValue } from './types';
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
  questionBoxStyle,
  questionNumberStyle,
  questionLabelStyle,
  answerTextStyle,
  bulletItemStyle,
  ratingBoxStyle,
  ratingNumberStyle,
  ratingMaxStyle,
  footerStyle,
} from './email-styles';

interface SurveyEmailProps {
  surveyConfig: SurveyConfig;
  answers: Record<string, AnswerValue>;
  respondent?: {
    name?: string;
    email?: string;
    company?: string;
  };
  submittedAt: string;
  ipAddress: string;
}

export function SurveyEmailTemplate({
  surveyConfig,
  answers,
  respondent,
  submittedAt,
  ipAddress,
}: SurveyEmailProps) {
  const previewText = `Yeni Anket Yanıtı: ${surveyConfig.title}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header Section */}
          <Section style={headerSectionStyle}>
            <Text style={badgeStyle}>SURVEY SYSTEM</Text>
            <Text style={titleStyle}>{surveyConfig.title}</Text>
            <Text style={metaStyle}>
              Tarih: {submittedAt} &bull; IP: {ipAddress}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Respondent Info Section */}
          {respondent && (respondent.name || respondent.email || respondent.company) && (
            <Section style={cardStyle}>
              <Text style={cardTitleStyle}>Katılımcı Bilgileri</Text>
              {respondent.name && (
                <Text style={infoTextStyle}>
                  <strong>Ad Soyad:</strong> {respondent.name}
                </Text>
              )}
              {respondent.email && (
                <Text style={infoTextStyle}>
                  <strong>E-posta:</strong> {respondent.email}
                </Text>
              )}
              {respondent.company && (
                <Text style={infoTextStyle}>
                  <strong>Şirket:</strong> {respondent.company}
                </Text>
              )}
            </Section>
          )}

          {/* Responses Section */}
          <Section style={{ marginTop: '20px' }}>
            <Text style={cardTitleStyle}>Yanıtlar</Text>
            {surveyConfig.questions.map((q, idx) => {
              const rawAnswer = answers[q.id];
              const qLabel = q.label.tr || q.label.en;

              return (
                <div key={q.id} style={questionBoxStyle}>
                  <Text style={questionNumberStyle}>Soru {idx + 1}</Text>
                  <Text style={questionLabelStyle}>{qLabel}</Text>

                  {/* Render based on Question Type */}
                  {q.type === 'rating' && (
                    <div style={ratingBoxStyle}>
                      <span style={ratingNumberStyle}>{String(rawAnswer ?? '-')}</span>
                      <span style={ratingMaxStyle}> / {q.max}</span>
                    </div>
                  )}

                  {q.type === 'multi_choice' && (
                    <div style={{ marginTop: '8px' }}>
                      {Array.isArray(rawAnswer) && rawAnswer.length > 0 ? (
                        rawAnswer.map((optId: string) => {
                          const option = q.options?.find((o) => o.id === optId);
                          const optLabel = option ? (option.label.tr || option.label.en) : optId;
                          return (
                            <Text key={optId} style={bulletItemStyle}>
                              &bull; {optLabel}
                            </Text>
                          );
                        })
                      ) : (
                        <Text style={answerTextStyle}>-</Text>
                      )}
                    </div>
                  )}

                  {q.type === 'single_choice' && (
                    <Text style={answerTextStyle}>
                      {(() => {
                        const option = q.options?.find((o) => o.id === rawAnswer);
                        return option ? (option.label.tr || option.label.en) : (String(rawAnswer || '-'));
                      })()}
                    </Text>
                  )}

                  {(q.type === 'short_text' || q.type === 'long_text') && (
                    <Text style={answerTextStyle}>{String(rawAnswer || '-')}</Text>
                  )}
                </div>
              );
            })}
          </Section>

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            Bu e-posta İzole Anket Sistemi tarafından otomatik olarak gönderilmiştir.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
