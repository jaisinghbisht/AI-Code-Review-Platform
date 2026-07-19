CREATE TABLE ai_review (
    id UUID PRIMARY KEY,
    analysis_id UUID NOT NULL,
    model VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    execution_time_ms BIGINT,
    CONSTRAINT fk_analysis
        FOREIGN KEY(analysis_id)
            REFERENCES project_analysis(id)
);

CREATE TABLE review_section (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    CONSTRAINT fk_review
        FOREIGN KEY(review_id)
            REFERENCES ai_review(id)
);
