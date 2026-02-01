import React, { useEffect, useState, useRef, createElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Printer,
  Share2,
  Download,
  Copy,
  Gavel,
  Clock,
  AlertCircle,
  MapPin,
  ChevronRight,
  Users,
  Building,
  Scale,
  BookOpen,
  Check } from
'lucide-react';
import { ShareModal } from '../modals/ShareModal';
export const LegalNoticeDetailPage = () => {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedNotices, setRelatedNotices] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const noticeTextRef = useRef(null);
  // Simulate fetching notice data
  useEffect(() => {
    setLoading(true);
    // Mock API call delay
    setTimeout(() => {
      // Mock data
      const mockNotice = {
        id: 'ln-2024-001234',
        type: 'FORECLOSURE NOTICE',
        status: 'ACTIVE',
        caseNumber: '2024-CA-001234',
        publishDate: 'August 1, 2024',
        expiryDate: 'August 31, 2024',
        court: 'Circuit Court, Pinellas County, Florida',
        plaintiffName: 'First National Bank of Clearwater',
        defendantName: 'John & Jane Doe',
        attorneyName: 'Smith & Associates, P.A.',
        attorneyPhone: '(727) 555-1234',
        attorneyEmail: 'legal@smithassociates.com',
        propertyAddress: '123 Main Street, Clearwater, FL 33755',
        legalDescription:
        'Lot 7, Block 3, CLEARWATER HEIGHTS, according to the map or plat thereof as recorded in Plat Book 15, Page 32, Public Records of Pinellas County, Florida.',
        hearingDate: 'September 15, 2024',
        hearingTime: '9:00 AM',
        hearingLocation:
        'Pinellas County Justice Center, Courtroom 14, 14250 49th Street North, Clearwater, FL 33762',
        fullText: `NOTICE OF FORECLOSURE SALE
NOTICE IS HEREBY GIVEN pursuant to a Final Judgment of Mortgage Foreclosure dated July 15, 2024, and entered in Case No. 2024-CA-001234 of the Circuit Court of the Sixth Judicial Circuit in and for Pinellas County, Florida wherein FIRST NATIONAL BANK OF CLEARWATER is the Plaintiff and JOHN DOE and JANE DOE are the Defendants, the Clerk of the Court will sell to the highest and best bidder for cash at www.pinellas.realforeclose.com at 10:00AM on September 15, 2024, the following described property as set forth in said Final Judgment:
Lot 7, Block 3, CLEARWATER HEIGHTS, according to the map or plat thereof as recorded in Plat Book 15, Page 32, Public Records of Pinellas County, Florida.
Commonly known as: 123 Main Street, Clearwater, FL 33755
Any person claiming an interest in the surplus from the sale, if any, other than the property owner as of the date of the Lis Pendens must file a claim within sixty (60) days after the sale.
If you are a person with a disability who needs any accommodation in order to participate in this proceeding, you are entitled, at no cost to you, to the provision of certain assistance. Please contact the Human Rights Office, 400 S. Ft. Harrison Ave., Suite 300, Clearwater, FL 33756, (727) 464-4062, at least 7 days before your scheduled court appearance, or immediately upon receiving this notification if the time before the scheduled appearance is less than 7 days; if you are hearing or voice impaired, call 711.
Dated this 1st day of August, 2024.
Smith & Associates, P.A.
Attorney for Plaintiff
123 Legal Lane, Suite 400
Clearwater, FL 33756
Phone: (727) 555-1234
Email: legal@smithassociates.com`,
        views: 124,
        lastUpdated: 'August 2, 2024'
      };
      // Mock related notices
      const mockRelatedNotices = [
      {
        id: 'ln-2024-001235',
        type: 'FORECLOSURE NOTICE',
        caseNumber: '2024-CA-001235',
        publishDate: 'July 29, 2024',
        expiryDate: 'August 29, 2024',
        court: 'Circuit Court, Pinellas County, Florida',
        preview: 'Property: 456 Oak Avenue, Clearwater, FL 33756'
      },
      {
        id: 'ln-2024-001236',
        type: 'FORECLOSURE NOTICE',
        caseNumber: '2024-CA-001236',
        publishDate: 'July 25, 2024',
        expiryDate: 'August 25, 2024',
        court: 'Circuit Court, Pinellas County, Florida',
        preview: 'Property: 789 Pine Street, Clearwater, FL 33755'
      },
      {
        id: 'ln-2024-001237',
        type: 'PROBATE NOTICE',
        caseNumber: '2024-CP-001237',
        publishDate: 'July 30, 2024',
        expiryDate: 'August 30, 2024',
        court: 'Circuit Court, Pinellas County, Florida',
        preview: 'Estate of: Sarah Johnson'
      }];

      setNotice(mockNotice);
      setRelatedNotices(mockRelatedNotices);
      setLoading(false);
    }, 1000);
  }, []);
  const handleBack = () => {
    navigate('/legalNoticesList');
  };
  const handleRelatedNoticeClick = (noticeId) => {
    // In a real app, this would navigate to the specific notice
    // For now, we'll just reload the current page to simulate
    window.scrollTo(0, 0);
  };
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };
  // Handle download functionality
  const handleDownload = () => {
    if (!notice) return;
    // Create a text file with the notice content
    const element = document.createElement('a');
    const file = new Blob(
      [`${notice.type} - Case #${notice.caseNumber}\n\n${notice.fullText}`],
      {
        type: 'text/plain'
      }
    );
    element.href = URL.createObjectURL(file);
    element.download = `Legal_Notice_${notice.caseNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  // Handle share functionality
  const handleShare = () => {
    setShowShareModal(true);
  };
  // Handle copy text functionality
  const handleCopyText = () => {
    if (!notice) return;
    navigator.clipboard.
    writeText(notice.fullText).
    then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).
    catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };
  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 w-3/4 bg-gray-200 rounded mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>);

  }
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-700 hover:underline mb-4">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Legal Notices
        </button>

        {/* Notice header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                {notice.type}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {notice.type}: Case #{notice.caseNumber}
              </h1>
              <p className="text-gray-600 mt-1">{notice.court}</p>
            </div>
            <div className="flex space-x-2">
              <button
                className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={handlePrint}
                title="Print Notice">

                <Printer className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={handleShare}
                title="Share Notice">

                <Share2 className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-gray-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={handleDownload}
                title="Download Notice">

                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start">
              <Calendar className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Published Date</p>
                <p className="font-medium">{notice.publishDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Expiry Date</p>
                <p className="font-medium">{notice.expiryDate}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Property Address</p>
                <p className="font-medium">{notice.propertyAddress}</p>
              </div>
            </div>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-green-600">{notice.status}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <Building className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Plaintiff</p>
                <p className="font-medium">{notice.plaintiffName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Defendant</p>
                <p className="font-medium">{notice.defendantName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Scale className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Attorney</p>
                <p className="font-medium">{notice.attorneyName}</p>
                <p className="text-sm text-gray-500">
                  {notice.attorneyPhone} | {notice.attorneyEmail}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="h-5 w-5 text-indigo-700 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Hearing</p>
                <p className="font-medium">
                  {notice.hearingDate} at {notice.hearingTime}
                </p>
                <p className="text-sm text-gray-500">
                  {notice.hearingLocation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal notice content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 text-indigo-700 mr-2" />
              Legal Notice Text
            </h2>
            <button
              className="flex items-center text-indigo-700 text-sm hover:underline transition-colors"
              onClick={handleCopyText}>

              {copied ?
              <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied!
                </> :

              <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy Text
                </>
              }
            </button>
          </div>
          <div
            ref={noticeTextRef}
            className="border border-gray-200 rounded-lg p-6 bg-gray-50 font-mono text-sm whitespace-pre-line">

            {notice.fullText}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <div>Last updated: {notice.lastUpdated}</div>
            <div>{notice.views} views</div>
          </div>
        </div>

        {/* Related notices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Gavel className="h-5 w-5 text-indigo-700 mr-2" />
            Related Legal Notices
          </h2>
          <div className="space-y-3">
            {relatedNotices.map((relatedNotice) =>
            <div
              key={relatedNotice.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
              onClick={() => handleRelatedNoticeClick(relatedNotice.id)}>

                <div className="flex justify-between">
                  <div className="text-xs font-medium text-indigo-700 mb-1">
                    {relatedNotice.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    {relatedNotice.publishDate}
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {relatedNotice.preview}
                </h3>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <div>Case #{relatedNotice.caseNumber}</div>
                  <button className="text-indigo-700 flex items-center hover:underline">
                    View <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Need to publish a legal notice?
          </h2>
          <p className="text-gray-600 mb-4">
            Legal notices are an important part of the public record. If you
            need to publish a legal notice, you can do so through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/legalNoticeCreator')}
              className="bg-indigo-700 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-800 transition-colors">

              Create a Legal Notice
            </button>
            <button
              onClick={() => navigate('/legalNoticesList')}
              className="border border-indigo-700 text-indigo-700 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 transition-colors">

              Browse All Legal Notices
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title: `${notice.type}: Case #${notice.caseNumber}`
        }} />

      }
    </div>);

};