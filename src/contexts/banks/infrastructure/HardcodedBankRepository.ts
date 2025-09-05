import type { BankRepository } from '../domain/BankRepository.js';
import type { Bank, BankFilters, PaginatedApiResponse } from '../domain/Bank.js';

export class HardcodedBankRepository implements BankRepository {
  private readonly banks: Bank[] = [
    {
      bank_id: "santander_es",
      name: "Banco Santander España",
      bank_codes: ["0049"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "santander",
      country: "ES",
      auth_type_choice_required: true,
      bic: "BSCHESMM",
      real_name: "Banco Santander, S.A.",
      product_code: "SAN_ES",
      logo_url: "https://cdn.nordigen.com/ais/santander_BSCHESMM.png",
      documentation: "Santander Open Banking API documentation"
    },
    {
      bank_id: "bbva_es",
      name: "BBVA España",
      bank_codes: ["0182"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "bbva",
      country: "ES",
      auth_type_choice_required: false,
      bic: "BBVAESMM",
      real_name: "Banco Bilbao Vizcaya Argentaria, S.A.",
      product_code: "BBVA_ES",
      logo_url: "https://cdn.nordigen.com/ais/bbva_BBVAESMM.png",
      documentation: "BBVA Open Banking API documentation"
    },
    {
      bank_id: "caixabank_es",
      name: "CaixaBank",
      bank_codes: ["2100"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "caixabank",
      country: "ES",
      auth_type_choice_required: true,
      bic: "CAIXESBB",
      real_name: "CaixaBank, S.A.",
      product_code: "CAIXA_ES",
      logo_url: "https://cdn.nordigen.com/ais/caixabank_CAIXESBB.png",
      documentation: "CaixaBank Open Banking API documentation"
    },
    {
      bank_id: "sabadell_es",
      name: "Banco Sabadell",
      bank_codes: ["0081"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "sabadell",
      country: "ES",
      auth_type_choice_required: false,
      bic: "BSABESBB",
      real_name: "Banco de Sabadell, S.A.",
      product_code: "SAB_ES",
      logo_url: "https://cdn.nordigen.com/ais/sabadell_BSABESBB.png",
      documentation: "Sabadell Open Banking API documentation"
    },
    {
      bank_id: "bankinter_es",
      name: "Bankinter",
      bank_codes: ["0128"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "bankinter",
      country: "ES",
      auth_type_choice_required: true,
      bic: "BKBKESMM",
      real_name: "Bankinter, S.A.",
      product_code: "BANK_ES",
      logo_url: "https://cdn.nordigen.com/ais/bankinter_BKBKESMM.png",
      documentation: "Bankinter Open Banking API documentation"
    },
    {
      bank_id: "openbank_es",
      name: "Openbank",
      bank_codes: ["0073"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "openbank",
      country: "ES",
      auth_type_choice_required: false,
      bic: "OPENESMM",
      real_name: "Openbank, S.A.",
      product_code: "OPEN_ES",
      logo_url: "https://cdn.nordigen.com/ais/openbank_OPENESMM.png",
      documentation: "Openbank Open Banking API documentation"
    },
    {
      bank_id: "ing_es",
      name: "ING España",
      bank_codes: ["1465"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "ing",
      country: "ES",
      auth_type_choice_required: true,
      bic: "INGDESMM",
      real_name: "ING Bank N.V.",
      product_code: "ING_ES",
      logo_url: "https://cdn.nordigen.com/ais/ing_INGDESMM.png",
      documentation: "ING Open Banking API documentation"
    },
    {
      bank_id: "unicaja_es",
      name: "Unicaja Banco",
      bank_codes: ["2103"],
      api: "berlin_group",
      api_version: "1.3.6",
      aspsp: "unicaja",
      country: "ES",
      auth_type_choice_required: false,
      bic: "UCJAES2M",
      real_name: "Unicaja Banco, S.A.",
      product_code: "UNI_ES",
      logo_url: "https://cdn.nordigen.com/ais/unicaja_UCJAES2M.png",
      documentation: "Unicaja Open Banking API documentation"
    }
  ];

  async findAll(filters: BankFilters): Promise<PaginatedApiResponse<Bank[]>> {
    let filteredBanks = [...this.banks];

    // Apply filters
    if (filters.name) {
      const nameFilter = filters.name.toLowerCase();
      filteredBanks = filteredBanks.filter(bank => 
        bank.name.toLowerCase().includes(nameFilter)
      );
    }

    if (filters.api) {
      filteredBanks = filteredBanks.filter(bank => 
        bank.api === filters.api
      );
    }

    if (filters.country) {
      filteredBanks = filteredBanks.filter(bank => 
        bank.country === filters.country
      );
    }

    // Note: For hardcoded data, we'll ignore env filter since we don't have environment configs here
    // In a real implementation, this would filter by environment availability

    const total = filteredBanks.length;
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100); // Max 100 per page
    const totalPages = Math.ceil(total / limit);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedBanks = filteredBanks.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginatedBanks,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
}