import * as CookieConsent from 'vanilla-cookieconsent';
import { Constants } from '$lib/constants';

const config: CookieConsent.CookieConsentConfig = {
  categories: {
    necessary: {
      enabled: true,
      readOnly: true
    },
    analytics: {
      autoClear: {
        cookies: [
          {
            name: /^_ga/ // regex: match all cookies starting with '_ga'
          },
          {
            name: '_gid' // string: exact cookie name
          }
        ]
      },
      services: {
        ga: {
          label: 'Google Analytics',
          onAccept: () => { },
          onReject: () => { }
        }
      }
    },
    ads: {}
  },

  onFirstConsent: ({ cookie }) => {
    // console.log('onFirstConsent fired', cookie);
  },

  onConsent: ({ cookie }) => {
    // console.log('onConsent fired!', cookie, CookieConsent.getUserPreferences());
  },

  onChange: ({ changedCategories, changedServices }) => {
    // console.log('onChange fired!', changedCategories, changedServices);
  },

  guiOptions: {
    consentModal: {
      layout: 'box inline',
      position: 'bottom left',
      equalWeightButtons: true,
      flipButtons: false
    },
    preferencesModal: {
      layout: 'box',
      equalWeightButtons: true,
      flipButtons: false
    }
  },

  language: {
    default: 'en',
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies 🍪',
          description:
            `We use cookies to enhance your experience on ${Constants.BRANDNAME}. By continuing to browse, you agree to our use of cookies.`,
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage preferences',
          footer: `
							<a href="/privacy-policy" target="_blank">Privacy Policy</a>
					`
        },
        preferencesModal: {
          title: 'Manage cookie preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Accept current selection',
          closeIconLabel: 'Close modal',
          serviceCounterLabel: 'Service|Services',
          sections: [
            {
              title: 'Your Privacy Choices',
              description: `In this panel you can express some preferences related to the processing of your personal information. You may review and change expressed choices at any time by resurfacing this panel via the provided link. To deny your consent to the specific processing activities described below, switch the toggles to off or use the "Reject all" button and confirm you want to save your choices.`
            },
            {
              title: 'Strictly Necessary',
              description:
                'These cookies are essential for the proper functioning of the website and cannot be disabled.',
              linkedCategory: 'necessary'
            },
            {
              title: 'Performance and Analytics',
              description:
                'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
              linkedCategory: 'analytics',
              cookieTable: {
                caption: 'Cookie table',
                headers: {
                  name: 'Cookie',
                  domain: 'Domain',
                  desc: 'Description'
                },
                body: [
                  {
                    name: '_ga',
                    domain: 'enoshkind.com',
                    desc: 'Used to distinguish users for Google Analytics'
                  },
                  {
                    name: '_gid',
                    domain: 'enoshkind.com',
                    desc: 'Used to distinguish users for Google Analytics'
                  }
                ]
              }
            },
            {
              title: 'Targeting and Advertising',
              description:
                'These cookies are used to make advertising messages more relevant to you and your interests. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
              linkedCategory: 'ads'
            },
            {
              title: 'More information',
              description:
                'For any queries in relation to our policy on cookies and your choices, please <a href="/contact">contact us</a>'
            }
          ]
        }
      }
    }
  }
};

export default config;
