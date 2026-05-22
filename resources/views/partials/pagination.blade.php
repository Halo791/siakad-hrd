@if ($paginator->hasPages())
    <nav class="siakad-pagination" role="navigation" aria-label="Pagination Navigation">
        <div class="page-summary">
            Menampilkan {{ $paginator->firstItem() }}-{{ $paginator->lastItem() }} dari {{ $paginator->total() }} data
        </div>
        <div class="page-actions">
            @if ($paginator->onFirstPage())
                <span class="page-btn disabled">Sebelumnya</span>
            @else
                <a class="page-btn" href="{{ $paginator->previousPageUrl() }}" rel="prev">Sebelumnya</a>
            @endif

            <span class="page-current">Halaman {{ $paginator->currentPage() }} / {{ $paginator->lastPage() }}</span>

            @if ($paginator->hasMorePages())
                <a class="page-btn" href="{{ $paginator->nextPageUrl() }}" rel="next">Berikutnya</a>
            @else
                <span class="page-btn disabled">Berikutnya</span>
            @endif
        </div>
    </nav>
@endif
