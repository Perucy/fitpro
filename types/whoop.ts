export interface WhoopUser {
    id: string;
    display_name: string;
    email: string;
    followers: { total: number };
    images: { url: string }[];
    country?: string;
    product?: string;
}

export interface WhoopAuthResult {
    success: boolean;
    user_id: string;
    user_info: WhoopUser;
    message: string;
}

export interface WhoopLinkResponse {
    success: boolean;
    auth_url?: string;
    error?: string;
}

export interface WhoopProfile {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    display_name: string;
    country?: string;
    created_at: string;
    updated_at: string;
}

export interface WhoopRecovery {
    cycle_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    score: {
        user_calibrating: boolean;
        recovery_score: number;
        hrv_rmssd_milli: number;
        spo2_percentage?: number;
        resting_heart_rate: number;
        hr_variability: number;
    };
    sleep?: {
        id: string;
        nap: boolean;
        score_state: string;
        score?: {
            stage_summary: {
                total_in_bed_time_milli: number;
                total_awake_time_milli: number;
                total_no_data_time_milli: number;
                total_light_sleep_time_milli: number;
                total_slow_wave_sleep_time_milli: number;
                total_rem_sleep_time_milli: number;
                sleep_cycle_count: number;
                disturbance_count: number;
            };
            sleep_needed: {
                baseline_milli: number;
                need_from_sleep_debt_milli: number;
                need_from_recent_strain_milli: number;
                need_from_recent_nap_milli: number;
            };
            respiratory_rate: number;
            sleep_performance_percentage: number;
            sleep_consistency_percentage: number;
            sleep_efficiency_percentage: number;
        };
    };
}

export interface WhoopStatus {
    connected: boolean;
    user_id?: string;
    last_sync?: string;
}

export interface WhoopServiceError extends Error {
    status?: number;
    code?: string;
}