@php
    $items = $attachments->get($table.'|'.$id, collect());
    $params = array_merge(['resource' => $resource, 'id' => $id], $extraParams ?? []);
    $titleLabel = $titleLabel ?? 'Judul file';
    $urlLabel = $urlLabel ?? 'Link Google Drive / gambar';
    $buttonText = $buttonText ?? 'Simpan Link';
@endphp

<div class="preview-grid">
    @foreach($items as $attachment)
        <span>
            <img class="preview-img" src="{{ $previewUrl($attachment->imageUrl) }}" alt="{{ $attachment->title }}">
            <form method="post" action="{{ route($destroyRoute, $attachment->id) }}">
                @csrf
                @method('DELETE')
                <button class="badge gray" type="submit" style="border:0;margin-top:4px">Hapus</button>
            </form>
        </span>
    @endforeach
</div>

<form class="mini-form" method="post" action="{{ route($storeRoute, $params) }}">
    @csrf
    <label>{{ $titleLabel }}<input name="title" placeholder="Preview / dokumen"></label>
    <label>{{ $urlLabel }}<input name="imageUrl" placeholder="https://drive.google.com/file/d/.../view"></label>
    <button class="btn" type="submit">{{ $buttonText }}</button>
</form>
