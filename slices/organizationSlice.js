import { createSlice } from '@reduxjs/toolkit';

const organizationSlice = createSlice({
    name: 'organization',
    initialState: {
        // General organization data
        loading: false,
        data: null,
        error: '',
        
        // Access control states (from /organization/profile/status)
        accessStatus: null,
        accessLoading: false,
        profileStatus: null,
        contractStatus: null,
        hasCompleteAccess: false,
        lastStatusCheck: null,
        blockedMessage: null,
        nextSteps: [],
        
        // Profile management states (from /organization/profile)
        profileData: null,
        profileLoading: false,
        profileError: null,
        profileRejectionReason: null,
        
        // Contract management states (from /organization/contracts)
        contractsData: [],
        contractsLoading: false,
        contractsError: null,
        contractRejectionReason: null,
        contractUploadProgress: 0,
    },
    reducers: {
        setOrganizationData: (state, action) => {
            state.loading = false;
            state.data = action.payload;
            state.error = '';
        },
        setOrganizationLoading: (state, action) => {
            state.loading = action.payload;
        },
        setOrganizationError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        clearOrganizationData: (state) => {
            state.loading = false;
            state.data = null;
            state.error = '';
            // Clear access control states
            state.accessStatus = null;
            state.profileStatus = null;
            state.contractStatus = null;
            state.hasCompleteAccess = false;
            state.lastStatusCheck = null;
        },
        // Access control actions (API: /organization/profile/status)
        setAccessStatus: (state, action) => {
            const status = action.payload;
            console.log('🔥 Redux setAccessStatus called with:', {
                profile_status: status?.profile_status,
                contract_status: status?.contract_status,
                has_complete_access: status?.has_complete_access
            });
            state.accessLoading = false;
            state.accessStatus = status;
            state.profileStatus = status?.profile_status || null;
            state.contractStatus = status?.contract_status || null;
            state.hasCompleteAccess = status?.has_complete_access || false;
            state.blockedMessage = status?.blocked_message || null;
            state.nextSteps = status?.next_steps || [];
            state.profileRejectionReason = status?.profile_rejection_reason || null;
            state.contractRejectionReason = status?.contract_rejection_reason || null;
            state.lastStatusCheck = new Date().toISOString();
        },
        setAccessLoading: (state, action) => {
            state.accessLoading = action.payload;
        },
        updateProfileStatus: (state, action) => {
            state.profileStatus = action.payload;
            // 🔒 Update complete access based on both statuses
            // فقط اگر هر دو approved باشند، دسترسی کامل بده
            state.hasCompleteAccess = 
                action.payload === 'approved' && 
                state.contractStatus === 'approved';
            // Update accessStatus if it exists
            if (state.accessStatus) {
                state.accessStatus.profile_status = action.payload;
                state.accessStatus.has_complete_access = state.hasCompleteAccess;
            }
        },
        updateContractStatus: (state, action) => {
            state.contractStatus = action.payload;
            // 🔒 Update complete access based on both statuses
            // فقط اگر هر دو approved باشند، دسترسی کامل بده
            state.hasCompleteAccess = 
                state.profileStatus === 'approved' && 
                action.payload === 'approved';
            // Update accessStatus if it exists
            if (state.accessStatus) {
                state.accessStatus.contract_status = action.payload;
                state.accessStatus.has_complete_access = state.hasCompleteAccess;
            }
        },
        
        // Profile management actions (API: /organization/profile)
        setProfileData: (state, action) => {
            state.profileLoading = false;
            state.profileData = action.payload;
            state.profileError = null;
            // Sync with access status if profile has status
            if (action.payload?.status) {
                state.profileStatus = action.payload.status;
                state.profileRejectionReason = action.payload.rejection_reason || null;
            }
        },
        setProfileLoading: (state, action) => {
            state.profileLoading = action.payload;
        },
        setProfileError: (state, action) => {
            state.profileLoading = false;
            state.profileError = action.payload;
        },
        updateProfileField: (state, action) => {
            const { field, value } = action.payload;
            if (state.profileData) {
                state.profileData[field] = value;
            }
        },
        
        // Contract management actions (API: /organization/contracts)
        setContractsData: (state, action) => {
            state.contractsLoading = false;
            state.contractsData = action.payload;
            state.contractsError = null;
            // Update contract status from latest contract
            if (action.payload && action.payload.length > 0) {
                const latestContract = action.payload[0];
                state.contractStatus = latestContract.status;
                state.contractRejectionReason = latestContract.rejection_reason || null;
            }
        },
        setContractsLoading: (state, action) => {
            state.contractsLoading = action.payload;
        },
        setContractsError: (state, action) => {
            state.contractsLoading = false;
            state.contractsError = action.payload;
        },
        setContractUploadProgress: (state, action) => {
            state.contractUploadProgress = action.payload;
        },
        addNewContract: (state, action) => {
            state.contractsData.unshift(action.payload);
            state.contractStatus = action.payload.status;
            state.contractUploadProgress = 0;
        },
        
        // Clear specific data sections
        clearAccessData: (state) => {
            state.accessStatus = null;
            state.accessLoading = false;
            state.profileStatus = null;
            state.contractStatus = null;
            state.hasCompleteAccess = false;
            state.lastStatusCheck = null;
            state.blockedMessage = null;
            state.nextSteps = [];
        },
        clearProfileData: (state) => {
            state.profileData = null;
            state.profileLoading = false;
            state.profileError = null;
            state.profileRejectionReason = null;
        },
        clearContractsData: (state) => {
            state.contractsData = [];
            state.contractsLoading = false;
            state.contractsError = null;
            state.contractRejectionReason = null;
            state.contractUploadProgress = 0;
        },
    }
});

export const { 
    // Original actions
    setOrganizationData, 
    setOrganizationLoading, 
    setOrganizationError, 
    clearOrganizationData,
    
    // Access control actions
    setAccessStatus,
    setAccessLoading,
    updateProfileStatus,
    updateContractStatus,
    clearAccessData,
    
    // Profile management actions
    setProfileData,
    setProfileLoading,
    setProfileError,
    updateProfileField,
    clearProfileData,
    
    // Contract management actions
    setContractsData,
    setContractsLoading,
    setContractsError,
    setContractUploadProgress,
    addNewContract,
    clearContractsData,
} = organizationSlice.actions;

export default organizationSlice.reducer;
