export type WebPresencePayload = {
  status: string
  statusCode: number
  result: {
    details: Record<string, unknown>
    checkListSummary: {
      overall: Record<string, 'Yes' | 'No' | '-'>
      details: Record<string, Record<string, 'Yes' | 'No' | '-' | string>>
    }
    summary: {
      action: string
      details: string[]
    }
  }
}

export const sampleWebPresencePayload: WebPresencePayload = {
  status: 'success',
  statusCode: 200,
  result: {
    details: {
      businessOwnershipDiscrepancy: {
        linkageVerification: {
          searchResults: [
            {
              sourceType: 'License databases',
              excerpts:
                'Name: YONALEY, BRIAN ALAN (Primary Name) ; PULTE HOME COMPANY, LLC (DBA Name) ; Main Address: 24311 WALDEN CENTER DRIVE STE 300. BONITA SPRINGS Florida 34134.',
              summary:
                'Official Florida Department of Business and Professional Regulation record linking Brian Alan Yonaley as the primary name associated with Pulte Home Company, LLC at the Walden Center Drive address.',
              link: 'http://myfloridalicense.com/LicenseDetail.asp?SID=&id=B0177DA53BC76C97182A8B94A9C660B9',
            },
            {
              sourceType: 'License databases',
              excerpts:
                'PULTE HOME COMPANY, LLC. DBA: PULTE HOME COMPANY, LLC. Owner: YONALEY, BRIAN ALAN. License Number: FRO4947. State: Florida. Status: active.',
              summary:
                'Contractor license verification site confirming Brian Alan Yonaley as the owner/qualifying agent for Pulte Home Company, LLC under license FRO4947.',
              link: 'http://contractorlicensecheck.com/contractor/pulte-home-company-llc-fl-FRO4947',
            },
          ],
        },
        directOwnershipConnection: {
          searchResults: [
            {
              excerpts:
                'Name: YONALEY, BRIAN ALAN (Primary Name) ; PULTE HOME COMPANY, LLC (DBA Name)',
              sourceType: 'Business registries',
              summary:
                "Business registry entry from the Florida DBPR showing the primary name 'YONALEY, BRIAN ALAN' listed with business name 'PULTE HOME COMPANY, LLC'. This record explicitly associates the individual as a primary qualified person for the business.",
              ownerName: 'YONALEY, BRIAN ALAN',
              link: 'http://myfloridalicense.com/LicenseDetail.asp?SID=&id=B0177DA53BC76C97182A8B94A9C660B9',
            },
            {
              excerpts: 'Owner: YONALEY, BRIAN ALAN. License Number: FRO4947.',
              sourceType: 'Business registries',
              summary:
                "Contractor license aggregator page explicitly listing 'Owner: YONALEY, BRIAN ALAN' for PULTE HOME COMPANY, LLC under license FRO4947, corroborating the owner's relationship to the business.",
              ownerName: 'YONALEY, BRIAN ALAN',
              link: 'http://contractorlicensecheck.com/contractor/pulte-home-company-llc-fl-FRO4947',
            },
          ],
        },
        otherOwnersIdentified: {
          searchResults: [
            {
              ownerTitle: 'Area Construction Manager',
              sourceType: 'Business website',
              excerpts:
                'Dan Gomez. Area Construction Manager · Phone: (239) 495-4800 · 24311 Walden Center Dr Ste 300 Bonita Springs FL 34134',
              summary:
                'The Suncoast Business Association listing names Dan Gomez as Area Construction Manager for Pulte Group/Pulte Home Company and lists the corporate office address, indicating a named senior operations executive associated with the business entity.',
              ownerName: 'Dan Gomez',
              link: 'http://business.suncoastba.org/list/member/pulte-group-331',
            },
          ],
        },
      },
      businessHistoryDiscrepancy: {
        websiteCreationDate: {
          date: '1995-08-07',
          website: 'https://www.pulte.com/',
        },
        oldestReviewDate: {
          date: '29/05/2025',
          searchResults: [
            {
              link: 'https://www.yelp.com/biz/pulte-homes-jacksonville-7',
              sourcePlatform: 'Yelp',
            },
          ],
        },
        oldestSocialMediaPresence: {
          date: '',
          searchResults: [],
        },
        licenseVerification: {
          isLicenseRequired: 'Yes',
          licensesRequired: [
            {
              licensingAgencyLink: 'https://www.myfloridalicense.com/',
              licenseType: 'Construction Business Information',
              link: 'https://www.myfloridalicense.com/LicenseDetail.asp?SID=&id=7C6B37D84154014892F4037A43179CA5',
              licensingAgency:
                'Florida Department of Business and Professional Regulation (DBPR)',
              verificationStatus: 'validated',
            },
          ],
        },
      },
      adverseMediaPresence: {
        applicantAdverseMedia: {
          searchResults: [],
        },
        businessAdverseMedia: {
          searchResults: [
            {
              adverseNature: 'Lawsuit',
              excerpts:
                'Pulte Home Company LLC, Plaintiff, v. Colony Specialty Insurance Company, Defendant.',
              summary:
                'Pulte Home Company LLC is involved in a federal insurance coverage and declaratory judgment lawsuit in Arizona. This litigation indicates material exposure to insurance recovery disputes and potential financial risk.',
              link: 'https://www.govinfo.gov/app/details/USCOURTS-azd-2_23-cv-01784',
            },
            {
              adverseNature: 'Lawsuit',
              excerpts:
                'PULTE HOME COMPANY, LLC, f/k/a PULTE HOME CORPORATION, INC. v. Legacy Park Community Association, Inc.',
              summary:
                'Ongoing state-court construction and indemnification litigation in Florida where the business is a named plaintiff. The case involves discovery motions and indicates potential contract liability and reputational risk.',
              link: 'https://trellis.law/doc/88866162/motion-to-compel-discovery-served-on-deft-cypress-property-casualty-ins-co-by-pltfs',
            },
            {
              adverseNature: 'Fraud',
              excerpts:
                'On July 30, 2025 a Complaint,Petition was filed involving a dispute between Jacob Wanek, Nicole Wanek, and Pulte Home Company Llc, for Fraud in',
              summary:
                'A civil complaint (Wanek v. Pulte Home Company LLC) was filed in July 2025 alleging construction defects and fraud. This recent litigation represents ongoing legal and reputational risk for the business entity.',
              link: 'https://trellis.law/doc/259844596/complaint-w-jury-demand-complaint',
            },
          ],
        },
        negativeMediaSearch: {
          searchResults: [
            {
              adverseNature: 'Scandal',
              excerpts: '3 Former PulteGroup Staffers Bring Charges Of Racial Bias',
              summary:
                'Three former employees of PulteGroup have filed charges alleging racial bias within the company. This public allegation of discriminatory workplace conduct represents a significant reputational risk for the Pulte corporate enterprise.',
              link: 'https://www.housingwire.com/articles/3-former-pultegroup-staffers-bring-charges-of-racial-bias',
            },
            {
              adverseNature: 'Scandal',
              excerpts: 'A New Lawsuit Vs. PulteGroup Ties To Dismissal Of Senior ...',
              summary:
                'A lawsuit has been filed against PulteGroup related to the dismissal of a senior executive. This legal action highlights internal corporate conflict and potential mismanagement, posing a reputational risk to the business entity.',
              link: 'https://www.housingwire.com/articles/a-new-lawsuit-vs-pultegroup-ties-to-dismissal-of-senior-exec/',
            },
            {
              adverseNature: 'Scandal',
              excerpts: 'PulteGroup Legal Plot Thickens As Firm Moves To Dismiss ...',
              summary:
                'Ongoing litigation involving PulteGroup has seen new developments as the firm moves to dismiss a lawsuit. This persistent legal activity indicates significant legal and reputational exposure for the Pulte brand and its subsidiaries.',
              link: 'https://www.housingwire.com/articles/pultegroup-legal-plot-thickens-as-firm-moves-to-dismiss-suit/',
            },
          ],
        },
      },
      socialMediaPresence: {
        reviewAggregators: {
          count: 4,
          totalReviews: 1,
          averageRatingAcrossAllPlatforms: '1.00',
          searchResults: [
            {
              averageRating: 'unavailable',
              numberOfReviews: '0',
              sourcePlatform: 'Yelp',
              link: 'https://www.yelp.com/biz/pulte-home-corporation-jacksonville-3',
            },
            {
              averageRating: 'unavailable',
              numberOfReviews: '0',
              sourcePlatform: 'Yelp',
              link: 'https://www.yelp.com/biz/pulte-homes-jacksonville-5',
            },
          ],
        },
        socialMedia: {
          count: 3,
          searchResults: [
            {
              sourcePlatform: 'Instagram',
              link: 'https://www.instagram.com/pultehomes/',
            },
            {
              sourcePlatform: 'Facebook',
              link: 'https://www.facebook.com/PulteHomes/',
            },
            {
              sourcePlatform: 'X',
              link: 'https://x.com/PulteHomes',
            },
          ],
        },
      },
      // Key normalised from "fundingHistory" → "fundingHistoryExistence" to match row key
      fundingHistoryExistence: {
        searchResults: [
          {
            fundingAmount: '$800 Million',
            excerpts: 'PulteGroup Prices $800 Million Senior Notes Offering — Feb 10, 2026',
            summary:
              'Public records confirm PulteGroup, the parent of PULTE HOME COMPANY, LLC (associated with Brian Alan), secured $800 Million in a Senior Notes Offering on 2026-02-10. This corporate-level debt issuance indicates significant recent external capital injection into the broader business structure.',
            link: 'https://pultegroupinc.com/investor-relations/news/news-details/2026/PulteGroup-Prices-800-Million-Senior-Notes-Offering/default.aspx',
            investors: ['unavailable'],
            fundingDate: '2026-02-10',
            fundingType: 'Debt - Senior Notes Offering',
            sourcePlatform: 'PulteGroup Investor Relations / Press Release',
          },
        ],
      },
      convictedSexOffender: {
        searchResults: [],
      },
    },
    checkListSummary: {
      overall: {
        businessOwnershipDiscrepancy: 'Yes',
        businessHistoryDiscrepancy: 'No',
        adverseMediaPresence: 'Yes',
        fundingHistoryExistence: 'Yes',
        convictedSexOffender: 'No',
      },
      details: {
        businessOwnershipDiscrepancy: {
          linkageVerificationInsufficient: 'Yes',
          ownershipConnectionInsufficient: 'Yes',
          otherOwnersIdentified: 'No',
        },
        businessHistoryDiscrepancy: {
          websiteRecentlyCreated: 'No',
          reviewStartDateDiscrepancy: 'No',
          socialMediaStartDateDiscrepancy: 'No',
          stateLicenseVerificationFailed: 'No',
        },
        adverseMediaPresence: {
          applicantAdverseMediaPresence: 'No',
          businessAdverseMediaPresence: 'Yes',
          negativeMediaSearchPresence: 'Yes',
        },
        fundingHistoryExistence: {
          institutionalFunding: 'Yes',
        },
        convictedSexOffender: {
          sexOffenderRegistryMatch: 'No',
        },
      },
    },
    summary: {
      action: 'rejected',
      details: ['businessOwnershipDiscrepancy', 'adverseMediaPresence', 'fundingHistoryExistence'],
    },
  },
}
